"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LeaderboardPage() {
    const router = useRouter();
    const [scores, setScores] = useState<{ Montauban: number; Poitiers: number } | null>(null);
    const [error, setError] = useState("");

    // Récupération des scores
    useEffect(() => {
        const fetchScores = async () => {
            try {
                const scoresSnap = await getDoc(doc(db, "scores", "global"));
                if (scoresSnap.exists()) {
                    setScores(scoresSnap.data() as { Montauban: number; Poitiers: number });
                } else {
                    setScores({ Montauban: 0, Poitiers: 0 });
                }
            } catch (err) {
                console.error(err);
                setError("Erreur lors du chargement des scores.");
            }
        };

        fetchScores();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/leaderboard");
    };

    const handleGoToEnigme = () => {
        router.push("/enigme");
    };

    const handleGoToLogin = () => {
        router.push("/login");
    };

    const isLoggedIn = !!auth.currentUser;

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/background.jpeg')" }}>

            {/* Boutons en haut à gauche */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isLoggedIn ? (
                    <>
                        <button
                            onClick={handleGoToEnigme}
                            className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d] transition"
                        >
                            Retour à l'énigme
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d] transition"
                        >
                            Se déconnecter
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleGoToLogin}
                        className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d] transition"
                    >
                        Connexion
                    </button>
                )}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-80">
                <h1 className="text-3xl font-bold text-[#b55118] mb-4">🎅 LeaderBoard</h1>
                <p className="text-gray-600 mb-4">Voici le tableau des scores !</p>

                {error && <p className="text-red-600 mb-2">{error}</p>}

                {scores ? (
                    <div className="flex flex-col gap-2">
                        <div className="bg-green-100 text-black p-2 rounded">
                            <strong>Montauban:</strong> {scores.Montauban} points
                        </div>
                        <div className="bg-blue-100 text-black p-2 rounded">
                            <strong>Poitiers:</strong> {scores.Poitiers} points
                        </div>
                    </div>
                ) : (
                    <p>Chargement des scores…</p>
                )}
            </div>
        </main>
    );
}
