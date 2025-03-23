import { useEffect, useState } from "react";
import { getUserData } from "../api/userAPI";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<Transcript | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const data = await getUserData(user.id.toString());
          if (data.transcript) {
            try {
              const transcript =
                typeof data.transcript === "string"
                  ? JSON.parse(data.transcript)
                  : data.transcript;

              setTranscriptData(transcript);
            } catch (e) {
              console.error("Error parsing transcript:", e);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col gap-6 items-start overflow-auto">
      <h1 className="header">Settings</h1>

      <div>
        <h1 className="text-xl font-bold mb-2">Transcript</h1>
        <div className="h-full overflow-y-scroll">
          {isLoading ? (
            <div>Loading...</div>
          ) : transcriptData ? (
            <pre className="h-full">
              {JSON.stringify(transcriptData, null, 3)}
            </pre>
          ) : (
            <div>No transcript data found</div>
          )}
        </div>
      </div>
    </div>
  );
}
