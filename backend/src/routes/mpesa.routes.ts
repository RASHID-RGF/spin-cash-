import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import mpesaService from '../services/mpesa.service';

const router = Router();

/**
 * POST /api/mpesa/deposit
 * Initiate MPESA deposit via STK Push
 */
router.post('/deposit', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, amount, userId } = req.body;

        // Validate inputs
        if (!phoneNumber || !amount || !userId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['phoneNumber', 'amount', 'userId']
            });
        }

        // Validate phone number
        if (!mpesaService.validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({
                error: 'Invalid phone number format',
                message: 'Please provide a valid Kenyan phone number'
            });
        }

        // Validate amount
        if (!mpesaService.validateAmount(amount, 10, 150000)) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Amount must be between 10 and 150,000 KES'
            });
        }

        // Initiate STK Push
        const result = await mpesaService.stkPush(
            phoneNumber,
            amount,
            `DEPOSIT_${userId}_${Date.now()}`
        );

        res.json({
            success: true,
            message: 'STK Push initiated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Deposit error:', error);
        res.status(500).json({
            error: 'Failed to initiate deposit',
            message: error.message
        });
    }
});

/**
 * POST /api/mpesa/withdraw
 * Process MPESA withdrawal via B2C
 */
router.post('/withdraw', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, amount, userId } = req.body;

        // Validate inputs
        if (!phoneNumber || !amount || !userId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['phoneNumber', 'amount', 'userId']
            });
        }

        // Validate phone number
        if (!mpesaService.validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({
                error: 'Invalid phone number format'
            });
        }

        // Validate amount
        const minWithdrawal = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT || '100');
        const maxWithdrawal = parseInt(process.env.MAX_WITHDRAWAL_AMOUNT || '50000');

        if (!mpesaService.validateAmount(amount, minWithdrawal, maxWithdrawal)) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: `Amount must be between ${minWithdrawal} and ${maxWithdrawal} KES`
            });
        }

        // Process B2C payment
        const result = await mpesaService.b2cPayment(
            phoneNumber,
            amount,
            `Withdrawal for user ${userId}`
        );

        res.json({
            success: true,
            message: 'Withdrawal initiated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Withdrawal error:', error);
        res.status(500).json({
            error: 'Failed to process withdrawal',
            message: error.message
        });
    }
});

/**
 * POST /api/mpesa/callback
 * MPESA callback endpoint for STK Push
 */
router.post('/callback', async (req: Request, res: Response) => {
    try {
        console.log('MPESA Callback received:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;

        if (Body && Body.stkCallback) {
            const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

            console.log('Transaction Result:', {
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc
            });

            // Extract transaction details from metadata
            let transactionAmount = 0;
            let mpesaReceiptNumber = '';
            let transactionDate = '';
            let phoneNumber = '';

            if (CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach((item: any) => {
                    switch (item.Name) {
                        case 'Amount':
                            transactionAmount = item.Value;
                            break;
                        case 'MpesaReceiptNumber':
                            mpesaReceiptNumber = item.Value;
                            break;
                        case 'TransactionDate':
                            transactionDate = item.Value;
                            break;
                        case 'PhoneNumber':
                            phoneNumber = item.Value;
                            break;
                    }
                });
            }

            if (ResultCode === 0) {
                // Transaction successful - extract user ID from account reference
                // The account reference was set as `DEPOSIT_${userId}_${Date.now()}`
                const accountReference = Body.stkCallback.AccountReference || '';
                const userIdMatch = accountReference.match(/DEPOSIT_([^_]+)_/);

                if (userIdMatch) {
                    const userId = userIdMatch[1];

                    // Credit user wallet
                    const { data: wallet, error: walletError } = await supabase
                        .from('wallets')
                        .select('balance, total_earnings')
                        .eq('user_id', userId)
                        .single();

                    if (!walletError && wallet) {
                        const { error: updateError } = await supabase
                            .from('wallets')
                            .update({
                                balance: (wallet.balance || 0) + transactionAmount,
                                total_earnings: (wallet.total_earnings || 0) + transactionAmount
                            })
                            .eq('user_id', userId);

                        if (updateError) {
                            console.error('Wallet update failed:', updateError);
                        } else {
                            // Record transaction
                            await supabase
                                .from('transactions')
                                .insert({
                                    user_id: userId,
                                    type: 'deposit',
                                    amount: transactionAmount,
                                    description: `MPESA Deposit - ${mpesaReceiptNumber}`,
                                    status: 'completed',
                                    metadata: {
                                        mpesa_receipt: mpesaReceiptNumber,
                                        transaction_date: transactionDate,
                                        phone_number: phoneNumber
                                    }
                                });

                            // Award referral commission if applicable
                            // This would be handled by the referral system when deposits are made
                        }
                    }
                }
            }

            // Store callback data for debugging/reference
            await supabase
                .from('mpesa_callbacks')
                .insert({
                    merchant_request_id: MerchantRequestID,
                    checkout_request_id: CheckoutRequestID,
                    result_code: ResultCode,
                    result_desc: ResultDesc,
                    callback_data: req.body,
                    processed: true
                });
        }

        // Always respond with 200 to acknowledge receipt
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error: any) {
        console.error('Callback error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Failed' });
    }
});

/**
 * POST /api/mpesa/callback/result
 * B2C result callback
 */
router.post('/callback/result', async (req: Request, res: Response) => {
    try {
        console.log('B2C Result received:', JSON.stringify(req.body, null, 2));

        // TODO: Update withdrawal status in database

        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error: any) {
        console.error('B2C Result error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Failed' });
    }
});

/**
 * POST /api/mpesa/callback/timeout
 * B2C timeout callback
 */
router.post('/callback/timeout', async (req: Request, res: Response) => {
    try {
        console.log('B2C Timeout received:', JSON.stringify(req.body, null, 2));

        // TODO: Mark transaction as timed out

        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error: any) {
        console.error('B2C Timeout error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Failed' });
    }
});

/**
 * GET /api/mpesa/query/:checkoutRequestId
 * Query STK Push status
 */
router.get('/query/:checkoutRequestId', async (req: Request, res: Response) => {
    try {
        const { checkoutRequestId } = req.params;

        const result = await mpesaService.queryStkPushStatus(checkoutRequestId);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Query error:', error);
        res.status(500).json({
            error: 'Failed to query transaction status',
            message: error.message
        });
    }
});

export default router;
