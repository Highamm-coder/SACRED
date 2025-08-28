import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  height = "200px"
}) => {
  const quillRef = useRef();

  // Toolbar configuration for SACRED CMS
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  // Formats allowed
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'code-block'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .ql-toolbar {
          border-top: 1px solid #E6D7C9 !important;
          border-left: 1px solid #E6D7C9 !important;
          border-right: 1px solid #E6D7C9 !important;
          border-bottom: none !important;
          background-color: #F8F7F5;
          border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .ql-container {
          border-bottom: 1px solid #E6D7C9 !important;
          border-left: 1px solid #E6D7C9 !important;
          border-right: 1px solid #E6D7C9 !important;
          border-top: none !important;
          border-radius: 0 0 0.5rem 0.5rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .ql-editor {
          min-height: ${height};
          color: #6B5B73;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .ql-editor.ql-blank::before {
          color: #9CA3AF;
          font-style: normal;
        }
        
        .ql-toolbar .ql-picker-label {
          color: #2F4F3F;
        }
        
        .ql-toolbar .ql-stroke {
          stroke: #2F4F3F;
        }
        
        .ql-toolbar .ql-fill {
          fill: #2F4F3F;
        }
        
        .ql-toolbar button:hover {
          background-color: #E6D7C9;
          border-radius: 0.25rem;
        }
        
        .ql-toolbar button.ql-active {
          background-color: #C4756B;
          color: white;
          border-radius: 0.25rem;
        }
        
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: white;
        }
        
        .ql-toolbar button.ql-active .ql-fill {
          fill: white;
        }
        
        /* Custom styling for content */
        .ql-editor h1 {
          color: #2F4F3F;
          font-weight: 700;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .ql-editor h2 {
          color: #2F4F3F;
          font-weight: 600;
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .ql-editor h3 {
          color: #2F4F3F;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #C4756B;
          background-color: #F5F1EB;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .ql-editor a {
          color: #C4756B;
          text-decoration: underline;
        }
        
        .ql-editor strong {
          color: #2F4F3F;
          font-weight: 600;
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
};

export default RichTextEditor;