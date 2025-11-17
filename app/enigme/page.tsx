"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/lib/useAuth";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EnigmePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [question, setQuestion] = useState("Chargement de l'énigme…");
    const [value, setValue] = useState("Chargement des points");
    const [response, setResponse] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");
    const [yesterdayResult, setYesterdayResult] = useState<null | { correct: boolean; answer: string }>(null);
    const [userCity, setUserCity] = useState<string | null>(null);


    const today = new Date();
    const enigmeId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(today);
    if (today.getDate() === 8 || today.getDate() === 15) {
        yesterday.setDate(today.getDate() - 3);
    } else {
        yesterday.setDate(today.getDate() - 1);
    }
    const yesterdayId = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const jourActuel = today.getDate();

    // Redirection si non connecté
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Récupération de la question et de la réponse si déjà soumise
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const enigmeSnap = await getDoc(doc(db, "enigmes", enigmeId));
                if (enigmeSnap.exists()) {
                    setQuestion(enigmeSnap.data()?.question || "Énigme indisponible");
                    setValue(enigmeSnap.data()?.value || "Points indisponible")
                } else {
                    setQuestion("Aucune énigme trouvée pour aujourd'hui.");
                    setValue("Points indisponible");
                }

                // Vérifie si l'utilisateur a déjà répondu aujourd'hui
                const userAnswerSnap = await getDoc(doc(db, "answers", `${user.uid}_${enigmeId}`));
                if (userAnswerSnap.exists()) {
                    setSubmitted(true);
                    setMessage("Réponse déjà soumise. Les résultats seront disponibles demain.");
                }

                // Vérifie si l'utilisateur a répondu hier et récupère le résultat
                const yesterdaySnap = await getDoc(doc(db, "answers", `${user.uid}_${yesterdayId}`));
                if (yesterdaySnap.exists()) {
                    const data = yesterdaySnap.data();
                    if ("correct" in data && "answer" in data) {
                        setYesterdayResult({ correct: data.correct, answer: data.answer });
                    }
                }
            } catch (err) {
                console.error(err);
                setQuestion("Erreur lors du chargement de l'énigme.");
                setValue("Erreur lors du chargement des points");
            }
        };

        fetchData();
    }, [user, enigmeId, yesterdayId]);

    useEffect(() => {
        if (!user) return;

        const fetchUserCity = async () => {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                setUserCity(userDoc.data()?.city || "Montauban");
            }
        };

        fetchUserCity();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !response.trim()) return;

        try {
            const enigmeSnap = await getDoc(doc(db, "enigmes", enigmeId));
            const points = enigmeSnap.exists() ? enigmeSnap.data()?.value || 1 : 1;
            const correct =
                enigmeSnap.exists() &&
                response.trim().toLowerCase() === enigmeSnap.data()?.answer.toLowerCase();

            await setDoc(doc(db, "answers", `${user.uid}_${enigmeId}`), {
                uid: user.uid,
                enigmeId,
                response: response.trim(),
                correct,
                points: correct ? points : 0,
                city: userCity,
                submittedAt: new Date().toISOString(),
            });

            setSubmitted(true);
            setMessage("Réponse enregistrée. Les résultats seront disponibles demain.");
        } catch (err) {
            console.error(err);
            setMessage("Erreur lors de l'enregistrement de la réponse.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading || !user) {
        return (
            <main className="flex items-center justify-center min-h-screen">
                <p>Chargement…</p>
            </main>
        );
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/background.jpeg')" }}>

            <div className="absolute top-4 left-4 flex flex-col  gap-2">
                <button
                    onClick={() => router.push("/leaderboard")}
                    className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d] transition"
                >
                    Tableau des Scores
                </button>

                <button
                    onClick={handleLogout}
                    className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d] transition"
                >
                    Se déconnecter
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-130">
                <h1 className="text-3xl font-bold text-[#b55118] mb-4">🎅 Énigme du {jourActuel} ({value} points)</h1>

                {yesterdayResult && (
                    <p
                        className={`mb-4 p-2 rounded ${yesterdayResult.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        {yesterdayResult.correct ? "✅ Bravo !" : "❌ Perdu !"} La réponse à la précédente énigme était : <strong>{yesterdayResult.answer}</strong>
                    </p>
                )}

                {!submitted && (
                    <img
                        src={`/enigme_${enigmeId}.png`}
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                        alt="Image de l'énigme du jour"
                        className="mx-auto mb-4 rounded-xl max-w-xs"
                    />
                )}

                {enigmeId === '2025-12-12' && !submitted && (
                    <img
                        src="/enigme_12-12.png"
                        className="mx-auto mb-4 rounded-xl max-w-xs w-full sm:max-w-lg"
                    />
                )}

                {!submitted && (
                    <p className="text-gray-600 mb-4 whitespace-pre-line">{question}</p>
                )}

                {enigmeId === '2025-12-16' && !submitted && (
                    <img
                        src="/enigme_12_16.png"
                        className="mx-auto mb-4 rounded-xl shadow-md max-w-xs"
                    />
                )}

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Votre réponse"
                            className="border rounded p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="bg-[#b55118] text-white py-2 rounded hover:bg-[#f46e1d] transition"
                        >
                            Valider
                        </button>
                    </form>
                ) : (
                    <p className="text-gray-700 mt-2">{message}</p>
                )}
            </div>
        </main>
    );
}

