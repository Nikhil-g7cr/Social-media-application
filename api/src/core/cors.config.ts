export const corsOptions = {
    // Explicitly allow your Vite frontend URL instead of '*'
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    
    // Tell the backend to allow requests that include credentials (like cookies/auth headers)
    credentials: true,
    
    // It's also good practice to specify allowed methods and headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
};