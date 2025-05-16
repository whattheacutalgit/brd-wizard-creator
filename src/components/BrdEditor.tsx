
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Heading1, Heading2, ListOrdered, Download } from "lucide-react";
import { formatMarkdownText } from "@/lib/utils";

interface BrdEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
}

const BrdEditor: React.FC<BrdEditorProps> = ({ initialContent, onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [editMode, setEditMode] = useState(false);

  const handleFormat = (format: string) => {
    const textarea = document.getElementById('brd-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        cursorOffset = 1;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'list':
        formattedText = `* ${selectedText}`;
        cursorOffset = 2;
        break;
      default:
        break;
    }

    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(
        selectedText ? newPosition : start + cursorOffset,
        selectedText ? newPosition : start + cursorOffset
      );
    }, 0);
  };

  const handleSave = () => {
    onSave(content);
    setEditMode(false);
  };

  const exportToPdf = () => {
    const element = document.createElement('a');
    const formattedContent = content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .split('\n').join('<br>');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>BRD Document</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #000000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #000000;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          h1 {
            font-size: 24px;
            border-bottom: 1px solid #000000;
            padding-bottom: 5px;
          }
          h2 {
            font-size: 20px;
          }
          strong {
            font-weight: bold;
          }
          em {
            font-style: italic;
          }
          li {
            margin: 5px 0;
            list-style-type: disc;
            margin-left: 20px;
          }
        </style>
      </head>
      <body>
        <div class="document">${formattedContent}</div>
      </body>
      </html>
    `;
    
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'BRD_Document.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-md shadow-sm">
      {editMode ? (
        <div className="space-y-2">
          <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('bold')}
              className="text-gray-700 hover:bg-gray-200"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('italic')}
              className="text-gray-700 hover:bg-gray-200"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('h1')}
              className="text-gray-700 hover:bg-gray-200"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('h2')}
              className="text-gray-700 hover:bg-gray-200"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('list')}
              className="text-gray-700 hover:bg-gray-200"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditMode(false)}
                className="text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
          <textarea
            id="brd-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[500px] p-4 border-0 focus:outline-none focus:ring-0 font-mono text-gray-800"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-gray-100 border-b border-gray-300 p-2 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Business Requirements Document</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditMode(true)}
                className="text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Edit Document
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={exportToPdf}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          </div>
          <div 
            className="p-6 prose max-w-none h-[500px] overflow-y-auto"
          >
            {content.split('\n').map((line, i) => {
              const formattedLine = formatMarkdownText(line);
              return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine || "&nbsp;" }} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrdEditor;
