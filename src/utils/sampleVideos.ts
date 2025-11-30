interface Video {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    category: string;
    duration: string;
    tags: string[];
    featured: boolean;
    difficulty: string;
    prerequisites: string[];
    transcript: string;
    views: number;
    avg_rating: number;
    total_ratings: number;
    created_at: string;
}

export const sampleVideos: Video[] = [
    {
        id: "1",
        title: "Introduction to Forex Trading",
        description: "Learn the basics of forex trading, including currency pairs, pips, and fundamental concepts.",
        video_url: "https://www.youtube.com/watch?v=example1",
        thumbnail_url: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
        category: "Forex Basics",
        duration: "15:30",
        tags: ["forex", "trading", "beginner", "currency"],
        featured: true,
        difficulty: "beginner",
        prerequisites: [],
        transcript: "Welcome to forex trading basics...",
        views: 1250,
        avg_rating: 4.5,
        total_ratings: 89,
        created_at: "2025-01-15T10:00:00Z"
    },
    {
        id: "2",
        title: "Technical Analysis Fundamentals",
        description: "Master technical analysis with charts, indicators, and trading patterns.",
        video_url: "https://www.youtube.com/watch?v=example2",
        thumbnail_url: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
        category: "Technical Analysis",
        duration: "22:45",
        tags: ["technical analysis", "charts", "indicators", "patterns"],
        featured: false,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading"],
        transcript: "Technical analysis is the study of price action...",
        views: 890,
        avg_rating: 4.2,
        total_ratings: 67,
        created_at: "2025-01-20T14:30:00Z"
    },
    {
        id: "3",
        title: "Risk Management Strategies",
        description: "Essential risk management techniques to protect your trading capital.",
        video_url: "https://www.youtube.com/watch?v=example3",
        thumbnail_url: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
        category: "Risk Management",
        duration: "18:20",
        tags: ["risk management", "position sizing", "stop loss", "money management"],
        featured: true,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading"],
        transcript: "Risk management is crucial for long-term success...",
        views: 756,
        avg_rating: 4.7,
        total_ratings: 54,
        created_at: "2025-01-25T09:15:00Z"
    },
    {
        id: "4",
        title: "Advanced Chart Patterns",
        description: "Identify and trade advanced chart patterns for better entry and exit points.",
        video_url: "https://www.youtube.com/watch?v=example4",
        thumbnail_url: "https://img.youtube.com/vi/example4/maxresdefault.jpg",
        category: "Technical Analysis",
        duration: "28:10",
        tags: ["chart patterns", "advanced", "trading signals", "harmonic patterns"],
        featured: false,
        difficulty: "advanced",
        prerequisites: ["Technical Analysis Fundamentals", "Introduction to Forex Trading"],
        transcript: "Advanced chart patterns can provide high-probability setups...",
        views: 543,
        avg_rating: 4.3,
        total_ratings: 38,
        created_at: "2025-02-01T16:45:00Z"
    },
    {
        id: "5",
        title: "Psychology of Trading",
        description: "Master your trading psychology and emotional discipline.",
        video_url: "https://www.youtube.com/watch?v=example5",
        thumbnail_url: "https://img.youtube.com/vi/example5/maxresdefault.jpg",
        category: "Trading Psychology",
        duration: "25:55",
        tags: ["psychology", "discipline", "emotions", "mindset"],
        featured: true,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading"],
        transcript: "Trading psychology is often overlooked but crucial...",
        views: 923,
        avg_rating: 4.6,
        total_ratings: 71,
        created_at: "2025-02-05T11:20:00Z"
    },
    {
        id: "6",
        title: "Cryptocurrency Trading Basics",
        description: "Learn the fundamentals of cryptocurrency trading and blockchain technology.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_6",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_6/maxresdefault.jpg",
        category: "Cryptocurrency",
        duration: "20:15",
        tags: ["crypto", "bitcoin", "blockchain", "trading"],
        featured: false,
        difficulty: "beginner",
        prerequisites: [],
        transcript: "Cryptocurrency trading has revolutionized finance...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-02-10T13:00:00Z"
    },
    {
        id: "7",
        title: "Options Trading Strategies",
        description: "Advanced options trading strategies for experienced traders.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_7",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_7/maxresdefault.jpg",
        category: "Options Trading",
        duration: "35:40",
        tags: ["options", "derivatives", "strategies", "advanced"],
        featured: false,
        difficulty: "advanced",
        prerequisites: ["Introduction to Forex Trading", "Technical Analysis Fundamentals"],
        transcript: "Options trading offers unique opportunities...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-02-15T15:30:00Z"
    },
    {
        id: "8",
        title: "Day Trading vs Swing Trading",
        description: "Compare day trading and swing trading approaches and find your style.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_8",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_8/maxresdefault.jpg",
        category: "Trading Styles",
        duration: "18:25",
        tags: ["day trading", "swing trading", "trading styles", "timeframes"],
        featured: true,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading"],
        transcript: "Choosing the right trading style is crucial...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-02-20T10:45:00Z"
    },
    {
        id: "9",
        title: "Economic Indicators and News Trading",
        description: "How to trade based on economic indicators and news events.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_9",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_9/maxresdefault.jpg",
        category: "Fundamental Analysis",
        duration: "27:50",
        tags: ["economic indicators", "news trading", "fundamentals", "GDP"],
        featured: false,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading"],
        transcript: "Economic indicators drive market movements...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-02-25T14:15:00Z"
    },
    {
        id: "10",
        title: "Building a Trading Plan",
        description: "Create a comprehensive trading plan for consistent profits.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_10",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_10/maxresdefault.jpg",
        category: "Trading Strategy",
        duration: "22:30",
        tags: ["trading plan", "strategy", "consistency", "goals"],
        featured: true,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading", "Risk Management Strategies"],
        transcript: "A solid trading plan is your roadmap to success...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-03-01T11:00:00Z"
    },
    {
        id: "11",
        title: "Mobile Trading Apps and Tools",
        description: "Best mobile trading apps and tools for on-the-go trading.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_11",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_11/maxresdefault.jpg",
        category: "Trading Tools",
        duration: "16:45",
        tags: ["mobile trading", "apps", "tools", "platforms"],
        featured: false,
        difficulty: "beginner",
        prerequisites: [],
        transcript: "Mobile trading has made markets accessible anywhere...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-03-05T09:30:00Z"
    },
    {
        id: "12",
        title: "Understanding Leverage and Margin",
        description: "Master leverage and margin concepts in trading.",
        video_url: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_URL_12",
        thumbnail_url: "https://img.youtube.com/vi/REPLACE_WITH_ACTUAL_ID_12/maxresdefault.jpg",
        category: "Risk Management",
        duration: "19:20",
        tags: ["leverage", "margin", "risk", "capital"],
        featured: false,
        difficulty: "intermediate",
        prerequisites: ["Introduction to Forex Trading"],
        transcript: "Leverage can amplify both profits and losses...",
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: "2025-03-10T16:20:00Z"
    }
];

export const initializeSampleVideos = () => {
    const existing = localStorage.getItem('spincash_videos');
    if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem('spincash_videos', JSON.stringify(sampleVideos));
        console.log('Sample videos initialized!');
        return true;
    }
    return false;
};

export const addVideo = (video: Omit<Video, 'id' | 'views' | 'avg_rating' | 'total_ratings' | 'created_at'>) => {
    const existing = localStorage.getItem('spincash_videos');
    const videos = existing ? JSON.parse(existing) : [];

    const newVideo: Video = {
        ...video,
        id: Date.now().toString(),
        views: 0,
        avg_rating: 0,
        total_ratings: 0,
        created_at: new Date().toISOString()
    };

    videos.unshift(newVideo); // Add to beginning
    localStorage.setItem('spincash_videos', JSON.stringify(videos));
    return newVideo;
};

export const getVideos = (): Video[] => {
    const existing = localStorage.getItem('spincash_videos');
    return existing ? JSON.parse(existing) : [];
};