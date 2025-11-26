"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/lib/useAuth";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import useLang from "@/hooks/useLang";

export default function EnigmePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const { lang, setLang } = useLang();

    const t = {
        fr: {
            loading: "Chargement…",
            pointsLoading: "Chargement de l'énigme…",
            score: "Tableau des Scores",
            logout: "Se déconnecter",
            puzzleOf: "Énigme du",
            points: "points",
            alreadySubmitted: "Réponse déjà soumise. Les résultats seront disponibles demain.",
            submit: "Valider",
            yourAnswer: "Votre réponse",
            saved: "Réponse enregistrée. Les résultats seront disponibles demain.",
            yesterdayCorrect: "✅ Bravo !",
            yesterdayWrong: "❌ Perdu !",
            yesterdayWas: "La réponse à la précédente énigme était :",
        },
        en: {
            loading: "Loading…",
            pointsLoading: "Loading puzzle…",
            score: "Leaderboard",
            logout: "Log out",
            puzzleOf: "Puzzle of",
            points: "points",
            alreadySubmitted: "You already submitted today. Results available tomorrow.",
            submit: "Submit",
            yourAnswer: "Your answer",
            saved: "Answer saved. Results will be available tomorrow.",
            yesterdayCorrect: "✅ Well done!",
            yesterdayWrong: "❌ Wrong!",
            yesterdayWas: "Yesterday’s answer was:",
        },
    };

    const today = new Date();
    const jourActuel = today.getDate();

    // const enigmeId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const enigmeId = "2025-12-19";

    // Yesterday logic
    const yesterday = new Date(today);
    if (today.getDate() === 8 || today.getDate() === 15) yesterday.setDate(today.getDate() - 3);
    else yesterday.setDate(today.getDate() - 1);

    const yesterdayId = `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1
    ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const [question, setQuestion] = useState(t[lang].pointsLoading);
    const [value, setValue] = useState(t[lang].pointsLoading);
    const [response, setResponse] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");
    const [yesterdayResult, setYesterdayResult] = useState<null | {
        correct: boolean;
        answer: string;
    }>(null);
    const [userCity, setUserCity] = useState<string | null>(null);

    useEffect(() => {
        setQuestion(t[lang].pointsLoading);
        setValue(t[lang].pointsLoading);
    }, [lang]);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [user, loading, router]);

    // Load puzzle + previous answer
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const snap = await getDoc(doc(db, "enigmes", enigmeId));
                if (snap.exists()) {
                    const data = snap.data();
                    setQuestion(lang === "fr" ? data.question_fr : data.question_en);
                    setValue(data.value);
                } else {
                    setQuestion("Aucune énigme trouvée.");
                    setValue("?");
                }

                // Already answered today
                const userAns = await getDoc(doc(db, "answers", `${user.uid}_${enigmeId}`));
                if (userAns.exists()) {
                    setSubmitted(true);
                    setMessage(t[lang].alreadySubmitted);
                }

                // Yesterday result
                const ySnap = await getDoc(doc(db, "answers", `${user.uid}_${yesterdayId}`));
                if (ySnap.exists()) {
                    const data = ySnap.data();
                    if ("correct" in data && "answer" in data) {
                        setYesterdayResult({ correct: data.correct, answer: data.answer });
                    }
                }
            } catch (err) {
                console.error(err);
                setQuestion("Erreur de chargement.");
                setValue("?");
            }
        };

        fetchData();
    }, [user, enigmeId, yesterdayId, lang]);

    // Load city
    useEffect(() => {
        if (!user) return;
        const fetchCity = async () => {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) setUserCity(snap.data()?.city || "Montauban");
        };
        fetchCity();
    }, [user]);

    // Submit answer
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !response.trim()) return;

        try {
            const snap = await getDoc(doc(db, "enigmes", enigmeId));
            const points = snap.exists() ? snap.data()?.value || 1 : 1;

            const correct =
                snap.exists() &&
                response.trim().toLowerCase() === snap.data()?.answer.toLowerCase();

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
            setMessage(t[lang].saved);
        } catch (err) {
            console.error(err);
            setMessage("Erreur.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading || !user) {
        return (
            <main className="flex items-center justify-center min-h-screen">
                <p>{t[lang].loading}</p>
            </main>
        );
    }

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

            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <button
                    onClick={() => router.push("/leaderboard")}
                    className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d]"
                >
                    {t[lang].score}
                </button>

                <button
                    onClick={handleLogout}
                    className="bg-[#b55118] text-white py-2 px-3 rounded hover:bg-[#f46e1d]"
                >
                    {t[lang].logout}
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-130">
                <h1 className="text-3xl font-bold text-[#b55118] mb-4">
                    🎅 {t[lang].puzzleOf} {jourActuel} ({value} {t[lang].points})
                </h1>

                {yesterdayResult && (
                    <p
                        className={`mb-4 p-2 rounded ${yesterdayResult.correct
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {yesterdayResult.correct
                            ? t[lang].yesterdayCorrect
                            : t[lang].yesterdayWrong}{" "}
                        {t[lang].yesterdayWas} <strong>{yesterdayResult.answer}</strong>
                    </p>
                )}

                {!submitted && (
                    <img
                        src={`/enigme_${enigmeId}.png`}
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                        alt="Image de l'énigme du jour"
                        className="mx-auto mb-4 rounded-xl max-w-xs"
                    />
                )}

                {enigmeId === '2025-12-5' && !submitted && (
                    <img
                        src="/enigme_12-5.png"
                        className="mx-auto mb-4 max-w-xs"
                    />
                )}

                {enigmeId === '2025-12-12' && !submitted && (
                    <img
                        src="/enigme_12-12.png"
                        className="mx-auto mb-4 rounded-xl max-w-xs w-full sm:max-w-lg"
                    />
                )}

                {enigmeId === '2025-12-19' && !submitted && (
                    <img
                        src="/enigme_12-19.png"
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
                            placeholder={t[lang].yourAnswer}
                            className="border rounded p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="bg-[#b55118] text-white py-2 rounded hover:bg-[#f46e1d]"
                        >
                            {t[lang].submit}
                        </button>
                    </form>
                ) : (
                    <p className="text-gray-700 mt-2">{message}</p>
                )}
            </div>
        </main>
    );
}
