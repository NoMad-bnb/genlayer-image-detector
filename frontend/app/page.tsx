"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const account = createAccount();
const client = createClient({
  chain: studionet,
  account: account,
});

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.data.url;
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const imageUrl = await uploadToImgBB(image);

      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "analyze_image",
        args: [imageUrl],
        value: 0n,
      });

      await client.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.FINALIZED,
        retries: 60,
        interval: 5000,
      });

      const data = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_last_result",
        args: [],
      });

      setResult(JSON.parse(data as string));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Image Detector
            </h1>
            <p className="text-lg text-muted-foreground">
              Detect if an image is AI-generated or a real photograph using GenLayer blockchain.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="w-full h-48 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <p className="text-muted-foreground">Click to upload an image</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={analyzeImage}
              disabled={loading || !image}
              className="w-full py-3 px-6 rounded-lg bg-accent text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? "Analyzing... (this may take a minute)" : "Analyze Image"}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>

          {result && (
            <div className="glass-card p-6 mt-6 space-y-4">
              <h2 className="text-2xl font-bold">Result</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Type</p>
                  <p className={`text-2xl font-bold ${result.image_type === "Real" ? "text-green-400" : "text-red-400"}`}>
                    {result.image_type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Confidence Score</p>
                  <p className="text-2xl font-bold text-accent">{result.score}/10</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Reason</p>
                <p className="text-white">{result.reason}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="https://genlayer.com" target="_blank" className="hover:text-accent transition-colors">
              Powered by GenLayer
            </a>
            <a href="https://docs.genlayer.com" target="_blank" className="hover:text-accent transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}