import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/client";

const getAvatarColor = (email: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const charCode = email.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

export default function RecentWaitlistUsers() {
  const [recentUsers, setRecentUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const q = query(
          collection(db, "waitlist"),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const querySnapshot = await getDocs(q);
        const users: string[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().email) users.push(doc.data().email);
        });
        setRecentUsers(
          users.length > 0
            ? users
            : ["juan@mail.com", "ana@mail.com", "carlos@mail.com"],
        );
      } catch (error) {
        console.error("Error al obtener la lista de espera:", error);
      }
    };
    fetchWaitlist();
  }, []);

  if (recentUsers.length === 0) return null;

  return (
    <div className="animate-item mt-8 flex items-center gap-3">
      <div className="flex -space-x-3">
        {recentUsers.map((email, i) => (
          <div
            key={i}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-text text-xs font-bold border-2 border-text shadow-sm ${getAvatarColor(
              email,
            )}`}
            title={email}
          >
            {email.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text">+ 50</span>
        <span className="text-xs text-muted">en lista de espera</span>
      </div>
    </div>
  );
}
