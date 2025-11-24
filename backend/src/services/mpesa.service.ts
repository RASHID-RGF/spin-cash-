import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface MPESAConfig {
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: string;
    environment: 'sandbox' | 'production';
    callbackUrl: string;
}

class MPESAService {
    private config: MPESAConfig;
    private baseUrl: string;

    constructor() {
        this.config = {
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            passkey: process.env.MPESA_PASSKEY || '',
            shortcode: process.env.MPESA_SHORTCODE || '174379',
            environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
            callbackUrl: process.env.MPESA_CALLBACK_URL || ''
        };

        this.baseUrl = this.config.environment === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke'
            : 'https://api.safaricom.co.ke';
    }

    /**
     * Get OAuth access token from MPESA
     */
    async getAccessToken(): Promise<string> {
        try {
            const auth = Buffer.from(
                `${this.config.consumerKey}:${this.config.consumerSecret}`
            ).toString('base64');

            const response = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`
                    }
                }
            );

            return response.data.access_token;
        } catch (error: any) {
            console.error('MPESA Auth Error:', error.response?.data || error.message);
            throw new Error('Failed to get MPESA access token');
        }
    }

    /**
     * Initiate STK Push (Lipa Na MPESA Online)
     * Used for deposits
     */
    async stkPush(phoneNumber: string, amount: number, accountReference: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = this.getTimestamp();
            const password = this.generatePassword(timestamp);

            // Format phone number (remove leading 0 or +254, add 254)
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const payload = {
                BusinessShortCode: this.config.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(amount),
                PartyA: formattedPhone,
                PartyB: this.config.shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.config.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: 'SpinCash Deposit'
            };

            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('STK Push Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate STK Push');
        }
    }

    /**
     * B2C Payment (Business to Customer)
     * Used for withdrawals
     */
    async b2cPayment(phoneNumber: string, amount: number, remarks: string = 'Withdrawal'): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const payload = {
                InitiatorName: 'SpinCash',
                SecurityCredential: this.getSecurityCredential(),
                CommandID: 'BusinessPayment',
                Amount: Math.floor(amount),
                PartyA: this.config.shortcode,
                PartyB: formattedPhone,
                Remarks: remarks,
                QueueTimeOutURL: `${this.config.callbackUrl}/timeout`,
                ResultURL: `${this.config.callbackUrl}/result`,
                Occasion: 'Withdrawal'
            };

            const response = await axios.post(
                `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('B2C Payment Error:', error.response?.data || error.message);
            throw new Error('Failed to process B2C payment');
        }
    }

    /**
     * Query STK Push transaction status
     */
    async queryStkPushStatus(checkoutRequestId: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = this.getTimestamp();
            const password = this.generatePassword(timestamp);

            const payload = {
                BusinessShortCode: this.config.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };

            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('STK Query Error:', error.response?.data || error.message);
            throw new Error('Failed to query STK Push status');
        }
    }

    /**
     * Helper: Generate timestamp in MPESA format
     */
    private getTimestamp(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    /**
     * Helper: Generate password for MPESA requests
     */
    private generatePassword(timestamp: string): string {
        const data = `${this.config.shortcode}${this.config.passkey}${timestamp}`;
        return Buffer.from(data).toString('base64');
    }

    /**
     * Helper: Format phone number to MPESA format (254XXXXXXXXX)
     */
    private formatPhoneNumber(phone: string): string {
        // Remove any spaces, dashes, or plus signs
        let cleaned = phone.replace(/[\s\-\+]/g, '');

        // If starts with 0, replace with 254
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }

        // If doesn't start with 254, add it
        if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }

        return cleaned;
    }

    /**
     * Helper: Get security credential (encrypted initiator password)
     * In production, this should be properly encrypted with MPESA public key
     */
    private getSecurityCredential(): string {
        // TODO: Implement proper encryption with MPESA public certificate
        // For now, return a placeholder
        return 'ENCRYPTED_CREDENTIAL_HERE';
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phone: string): boolean {
        const cleaned = phone.replace(/[\s\-\+]/g, '');
        // Kenyan phone numbers: 254XXXXXXXXX or 07XXXXXXXX or 7XXXXXXXX
        const regex = /^(254|0)?[17]\d{8}$/;
        return regex.test(cleaned);
    }

    /**
     * Validate amount
     */
    validateAmount(amount: number, min: number = 1, max: number = 150000): boolean {
        return amount >= min && amount <= max && Number.isInteger(amount);
    }
}

export default new MPESAService();
