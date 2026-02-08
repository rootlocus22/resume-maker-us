// app/cover-letter/edit/[id]/page.js
"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../../lib/firebase"; // Import auth alongside db
import { doc, getDoc } from "firebase/firestore";
import CoverLetterBuilder from "../../../components/CoverLetterBuilder";

export default function CoverLetterEditPage({ params }) {
  const [coverLetter, setCoverLetter] = useState(null);
  const router = useRouter();
  const resolvedParams = use(params); // Unwrap params with React.use()
  const coverLetterId = resolvedParams.id;

  useEffect(() => {
    const fetchCoverLetter = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const coverLetterRef = doc(db, "users", user.uid, "coverLetters", coverLetterId);
      const docSnap = await getDoc(coverLetterRef);
      if (docSnap.exists()) {
        setCoverLetter({
          id: docSnap.id,
          ...docSnap.data(), // Spread the entire document data
        });
      } else {
        router.push("/my-cover-letters");
      }
    };
    fetchCoverLetter();
  }, [coverLetterId, router]);

  if (!coverLetter) return <div>Loading...</div>;

  return (
    <div className=" p-2">
      <CoverLetterBuilder
        initialData={coverLetter.coverLetterData} // Updated to match Firestore field name
        initialTemplate={coverLetter.template} // Updated to match Firestore field name
        initialCustomColors={coverLetter.customColors} // Updated to match Firestore field name
        coverLetterId={coverLetterId}
      />
    </div>
  );
}