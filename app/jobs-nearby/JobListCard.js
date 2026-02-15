import { memo, useMemo } from "react";
import Image from "next/image";
import { Building2, MapPin, Briefcase, Users, BookmarkPlus, CheckCircle2 } from "lucide-react";

const JobListCard = memo(function JobListCard({ job, isSelected, onSelect, onSave, isSaved }) {
    const postedDate = job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc)
        : new Date();

    const diffDays = Math.floor((new Date() - postedDate) / (1000 * 60 * 60 * 24));
    const timeAgo = diffDays === 0 ? "Now" : diffDays === 1 ? "1d" : `${diffDays}d`;

    // Deterministic applicant count based on job_id string char codes
    const applicants = useMemo(() => {
        const seed = job.job_id ? job.job_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        return (seed % 90) + 10; // Random number between 10 and 100
    }, [job.job_id]);

    const handleSaveClick = (e) => {
        e.stopPropagation();
        if (onSave) onSave(job);
    };

    return (
        <div className="relative group">
            <button
                id={`job-card-${job.job_id}`}
                onClick={() => onSelect(job.job_id)}
                className={`w-full text-left px-3 py-3 border-l-[3px] transition-all hover:bg-accent/5 ${isSelected
                    ? 'bg-accent/5 border-accent'
                    : 'bg-white border-transparent'
                    }`}
            >
                <div className="flex items-start gap-3">
                    {/* Company Logo - Smaller */}
                    <div className="w-10 h-10 bg-white flex-shrink-0 flex items-center justify-center border border-gray-100 p-0.5 mt-0.5 rounded shadow-sm">
                        {job.employer_logo ? (
                            <Image
                                src={job.employer_logo}
                                alt={job.employer_name}
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        ) : (
                            <Building2 className="w-5 h-5 text-gray-300" />
                        )}
                    </div>

                    {/* Job Info - Compact */}
                    <div className="flex-1 min-w-0 pr-6">
                        {/* Job Title */}
                        <h3 className={`text-[13px] font-bold leading-tight mb-0.5 line-clamp-2 ${isSelected ? 'text-primary' : 'text-gray-900'
                            }`}>
                            {job.job_title}
                        </h3>

                        {/* Company */}
                        <p className="text-[12px] font-medium text-gray-600 truncate leading-tight mb-1">
                            {job.employer_name}
                        </p>

                        {/* Metadata Row 1 - Location & Time */}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-0.5">
                            <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {job.job_city || 'Remote'}
                            </span>
                            <span>•</span>
                            <span>{timeAgo}</span>
                            {job.job_is_remote && (
                                <>
                                    <span>•</span>
                                    <span className="text-green-600 font-medium">Remote</span>
                                </>
                            )}
                        </div>

                        {/* Metadata Row 2 - Type & Applicants */}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            {job.job_employment_type && (
                                <>
                                    <span className="flex items-center gap-0.5">
                                        <Briefcase className="w-3 h-3" />
                                        {job.job_employment_type}
                                    </span>
                                    <span>•</span>
                                </>
                            )}
                            <span className="flex items-center gap-0.5 text-primary/70 font-medium">
                                <Users className="w-3 h-3" />
                                {applicants} applicants
                            </span>
                        </div>
                    </div>
                </div>
            </button>

            {/* Quick Save Hover Button */}
            <button
                onClick={handleSaveClick}
                disabled={isSaved}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-all border ${isSaved
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-white border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-accent hover:border-accent/30 shadow-sm'
                    }`}
                title={isSaved ? "Saved to My Jobs" : "Quick Save"}
            >
                {isSaved ? <CheckCircle2 size={14} /> : <BookmarkPlus size={14} />}
            </button>
        </div>
    );
});

export default JobListCard;
