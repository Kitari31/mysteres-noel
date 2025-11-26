"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import useLang from "@/hooks/useLang";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [city, setCity] = useState("Montauban"); // valeur par défaut
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { lang, setLang } = useLang();

    const t = {
        fr: {
            loginTitle: "🎅 Les Mystères d'Agileo",
            loginDesc: "Connectez-vous pour accéder à l'énigme du jour.",
            registerDesc: "Créez un compte pour participer au défi !",
            email: "Email",
            password: "Mot de passe",
            city: "Ville",
            signin: "Se connecter",
            signup: "S'inscrire",
            already: "Déjà inscrit ?",
            notyet: "Pas encore de compte ?",
            leaderboard: "Tableau des Scores",
        },
        en: {
            loginTitle: "🎅 Agileo Mysteries",
            loginDesc: "Log in to access today's puzzle.",
            registerDesc: "Create an account to join the challenge!",
            email: "Email",
            password: "Password",
            city: "City",
            signin: "Sign in",
            signup: "Sign up",
            already: "Already registered?",
            notyet: "No account yet?",
            leaderboard: "Scoreboard",
        },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (isRegister) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;

                // On crée le document user dans Firestore
                await setDoc(doc(db, "users", uid), {
                    uid,
                    email,
                    city,
                    createdAt: new Date().toISOString(),
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push("/enigme");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/background.jpeg')" }}
        >
            {/* 🔥 Bouton langue */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                    className="rounded-full p-1 bg-white shadow hover:bg-gray-100 transition"
                >
                    <img
                        src={lang === "fr" ? "/englishFlag.png" : "/franceFlag.png"}
                        alt="changer la langue"
                        className="w-10 h-10 object-cover rounded-full"
                    />
                </button>
            </div>

            {/* Bouton LeaderBoard */}
            <button onClick={() => router.push("/leaderboard")}
                className="absolute top-4 left-4 bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d] transition">
                {t[lang].leaderboard}
            </button>
            <div className="bg-white p-8 rounded-2xl w-120 text-center">
                <h1 className="text-3xl font-bold text-[#b55118] mb-4">{t[lang].loginTitle}</h1>
                <p className="text-gray-600 mb-4">
                    {isRegister ? t[lang].registerDesc : t[lang].loginDesc}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder={t[lang].email}
                        className="border rounded p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder={t[lang].password}
                        className="border rounded p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {isRegister && (
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="border rounded p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                            required
                        >
                            <option value="Montauban">Montauban</option>
                            <option value="Poitiers">Poitiers</option>
                        </select>
                    )}

                    <button
                        type="submit"
                        className="bg-[#b55118] text-white py-2 rounded hover:bg-[#f46e1d] transition"
                    >
                        {isRegister ? t[lang].signup : t[lang].signin}
                    </button>
                </form>

                <p className="mt-3 text-sm text-gray-600">
                    {isRegister ? t[lang].already : t[lang].notyet}{" "}
                    <button
                        className="text-[#b55118] underline hover:bg-[#f46e1d] transition"
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? t[lang].signin : t[lang].signup}
                    </button>
                </p>

                {error && <p className="mt-2 text-sm text-red-600 break-words">{error}</p>}
            </div>
        </main>
    );
}
