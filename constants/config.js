const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
     "https://chatapp-frontend-omega-plum.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "chattu-token";

export { corsOptions, CHATTU_TOKEN };
