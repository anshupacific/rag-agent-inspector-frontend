/** Where the backend lives. Set VITE_API_BASE_URL at build time; defaults to local dev. */
const configured = import.meta.env?.VITE_API_BASE_URL;

export const API_BASE_URL = (configured ?? "http://localhost:8000").replace(/\/+$/, "");

export const DATASET_URL = "https://github.com/anshupacific/rag-counterfactual-dataset";
