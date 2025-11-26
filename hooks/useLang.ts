"use client";

import { useEffect, useState } from "react";

export default function useLang() {
    const [lang, setLangState] = useState<"fr" | "en">("fr");

    useEffect(() => {
        const saved = localStorage.getItem("lang");
        if (saved === "fr" || saved === "en") setLangState(saved);
    }, []);

    const setLang = (value: "fr" | "en") => {
        setLangState(value);
        localStorage.setItem("lang", value);
    };

    return { lang, setLang };
}