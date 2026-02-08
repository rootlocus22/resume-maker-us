"use client";
import { useState, useRef } from "react";

// Placeholder image for when no photo is uploaded
const PLACEHOLDER_PHOTO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4MCAxNDBMMjAwIDEyMEwyMjAgMTQwTDIwMCAxNjBMMTgwIDE0MFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkFkZCBQaG90bzwvdGV4dD4KPC9zdmc+";
import { ChevronDown, ChevronUp, Plus, Trash2, Bot } from "lucide-react";
import toast from "react-hot-toast";

const JobSpecificResumeForm = ({
  data,
  onUpdate,
  sections,
  collapsedSections,
  toggleSectionCollapse,
  handleArrayUpdate,
  addArrayItem,
  removeArrayItem,
  customFields,
  updateCustomField,
  addCustomField,
  removeCustomField,
  disabled,
}) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoDataUrl = reader.result;
        onUpdate("personal", { ...data.personal, photo: photoDataUrl });
        // Track event
        // event({ action: "photo_upload", category: "JobSpecificResumeForm", label: "personal" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDelete = () => {
    onUpdate("personal", { ...data.personal, photo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // event({ action: "photo_delete", category: "JobSpecificResumeForm", label: "personal" });
  };

  const isDefaultPhoto = (photoUrl) => {
    return !photoUrl || photoUrl.includes("licdn.com") || photoUrl.includes("profile-displayphoto");
  };

  const generateAISuggestion = async (field, input, index = null) => {
    if (isLoadingAI) return;

    setIsLoadingAI(true);
    try {
      const response = await fetch("/api/generate-resume-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "anonymous", field, input }), // Adjust userId logic as needed
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI suggestion");
      }

      const { suggestion } = await response.json();

      if (field === "summary") {
        onUpdate(field, suggestion);
      } else if (index !== null) {
        handleArrayUpdate(field, index, "description", suggestion);
      }

      toast.success("AI suggestion applied!");
      
      // Show AI content review notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-blue-200 ring-opacity-5 border border-blue-300`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    AI Content Applied
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Please review and edit the suggestions to ensure they accurately reflect your experience.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-blue-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ),
        {
          duration: 3000,
          position: 'top-right',
          id: 'ai-content-review',
        }
      );
      
      // event({ action: "ai_suggestion", category: "JobSpecificResumeForm", label: field });
    } catch (error) {
      toast.error(error.message || "Failed to generate AI suggestion.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto ">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.key} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
              onClick={() => toggleSectionCollapse(section.key)}
            >
              <h3 className="text-lg font-semibold text-white">{section.label}</h3>
              <button className="text-white hover:text-blue-200 transition-colors" disabled={disabled}>
                {collapsedSections[section.key] ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>

            {!collapsedSections[section.key] && (
              <div className="p-2 space-y-4">
                {section.isObject && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {section.key === "personal" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {isDefaultPhoto(data.personal?.photo) ? "Using default photo" : "Your uploaded photo"}
                            </span>
                            {isDefaultPhoto(data.personal?.photo) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                          
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            ref={fileInputRef}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                            disabled={disabled}
                          />
                          
                          {(data.personal?.photo || isDefaultPhoto(data.personal?.photo)) && (
                            <div className="mt-2 flex items-center space-x-3">
                              <div className="relative">
                                <img
                                  src={data.personal?.photo || PLACEHOLDER_PHOTO}
                                  alt="Profile Preview"
                                  className={`w-16 h-16 rounded-full object-cover border-2 ${
                                    isDefaultPhoto(data.personal?.photo) ? 'border-orange-200' : 'border-green-200'
                                  }`}
                                />
                                {isDefaultPhoto(data.personal?.photo) && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                {isDefaultPhoto(data.personal?.photo) ? (
                                  <div>
                                    <p className="text-sm text-orange-600 font-medium">Default Photo Active</p>
                                    <p className="text-xs text-gray-500">Upload your own photo to personalize your resume</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm text-green-600 font-medium">Custom Photo Uploaded</p>
                                    <p className="text-xs text-gray-500">Your personal photo will appear on your resume</p>
                                  </div>
                                )}
                              </div>
                              
                              <button
                                onClick={handlePhotoDelete}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title={isDefaultPhoto(data.personal?.photo) ? "Remove default photo" : "Remove uploaded photo"}
                                disabled={disabled}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {section.fields.map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <input
                          type="text"
                          value={data[section.key]?.[field] || ""}
                          onChange={(e) =>
                            onUpdate(section.key, { ...data[section.key], [field]: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          disabled={disabled}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {section.isText && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{section.label}</label>
                    <div className="relative">
                      <textarea
                        value={data[section.key] || ""}
                        onChange={(e) => onUpdate(section.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                        placeholder={`Write your ${section.label.toLowerCase()} here...`}
                        disabled={disabled}
                      />
                      <button
                        onClick={() => generateAISuggestion(section.key, data.personal?.jobTitle || "Job Candidate")}
                        className="absolute bottom-2 right-2 p-1.5 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="AI Suggest"
                        disabled={isLoadingAI || disabled}
                      >
                        {isLoadingAI ? (
                          <svg
                            className="animate-spin h-4 w-4 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Bot size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {section.isArray && (
                  <>
                    {(data[section.key] || []).map((item, idx) => (
                      <div key={idx} className="p-2 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-800">
                            {section.label.slice(0, -1)} #{idx + 1}
                          </h4>
                          <button
                            onClick={() => removeArrayItem(section.key, idx)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            disabled={disabled}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.singleField ? (
                            <input
                              type="text"
                              value={item || ""}
                              onChange={(e) => {
                                const updatedArray = [...data[section.key]];
                                updatedArray[idx] = e.target.value;
                                onUpdate(section.key, updatedArray);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={section.label.slice(0, -1)}
                              disabled={disabled}
                            />
                          ) : (
                            section.fields.map((field) => (
                              <div key={field} className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                {field === "description" ? (
                                  <div className="relative">
                                    <textarea
                                      value={item[field] || ""}
                                      onChange={(e) => handleArrayUpdate(section.key, idx, field, e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                      disabled={disabled}
                                    />
                                    <button
                                      onClick={() =>
                                        generateAISuggestion(
                                          section.key,
                                          `${item.title || item.jobTitle || "Job"} at ${item.company || "Company"}`,
                                          idx
                                        )
                                      }
                                      className="absolute bottom-2 right-2 p-1.5 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="AI Suggest"
                                      disabled={isLoadingAI || disabled}
                                    >
                                      {isLoadingAI ? (
                                        <svg
                                          className="animate-spin h-4 w-4 text-blue-600"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                      ) : (
                                        <Bot size={18} />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={item[field] || ""}
                                    onChange={(e) => handleArrayUpdate(section.key, idx, field, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    disabled={disabled}
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(section.key)}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      disabled={disabled}
                    >
                      <Plus size={16} /> Add {section.label.slice(0, -1)}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div
            className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
            onClick={() => toggleSectionCollapse("custom")}
          >
            <h3 className="text-lg font-semibold text-white">Custom Fields</h3>
            <button className="text-white hover:text-blue-200 transition-colors" disabled={disabled}>
              {collapsedSections["custom"] ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
          {!collapsedSections["custom"] && (
            <div className="p-2 space-y-4">
              {customFields.map((field, index) => (
                <div key={index} className="p-2 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                      <input
                        type="text"
                        value={field.name || ""}
                        onChange={(e) => updateCustomField(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Field Name"
                        disabled={disabled}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Value</label>
                      <textarea
                        value={field.value || ""}
                        onChange={(e) => updateCustomField(index, "value", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                        placeholder="Field Value"
                        disabled={disabled}
                      />
                      <button
                        onClick={() => generateAISuggestion("custom", field.name || "Custom Field", index)}
                        className="absolute bottom-2 right-2 p-1.5 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="AI Suggest"
                        disabled={isLoadingAI || disabled}
                      >
                        {isLoadingAI ? (
                          <svg
                            className="animate-spin h-4 w-4 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Bot size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCustomField(index)}
                    className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                    disabled={disabled}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addCustomField}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                disabled={disabled}
              >
                <Plus size={16} /> Add Custom Field
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoadingAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-700 font-medium">Generating AI suggestions...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 text-center">
              This may take a few moments
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSpecificResumeForm;