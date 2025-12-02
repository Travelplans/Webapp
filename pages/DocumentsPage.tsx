import React, { useState } from 'react';
import DashboardLayout from '../components/shared/DashboardLayout';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { CustomerDocument } from '../types';
import { UploadIcon, DownloadIcon, PdfFileIcon, DocFileIcon, ImageIcon, GenericFileIcon } from '../components/shared/icons/Icons';

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { customers, addDocumentToCustomer } = useData();
  const { addToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const customerData = customers.find(c => c.email === user?.email);

  const getDocumentIcon = (type: CustomerDocument['type']) => {
    const wrapperClass = "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg";
    const iconClass = "w-6 h-6 text-white";

    switch (type) {
      case 'PDF': return <div className={`${wrapperClass} bg-red-500`}><PdfFileIcon className={iconClass} /></div>;
      case 'DOCX': return <div className={`${wrapperClass} bg-blue-500`}><DocFileIcon className={iconClass} /></div>;
      case 'JPG': case 'PNG': return <div className={`${wrapperClass} bg-purple-500`}><ImageIcon className={iconClass} /></div>;
      default: return <div className={`${wrapperClass} bg-gray-500`}><GenericFileIcon className={iconClass} /></div>;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = () => {
    if (customerData && selectedFiles.length > 0) {
      const fileCount = selectedFiles.length;
      selectedFiles.forEach(file => {
        const docType = file.name.split('.').pop()?.toUpperCase() as CustomerDocument['type'] || 'DOCX';
        addDocumentToCustomer(customerData.id, {
          name: file.name,
          type: ['PDF', 'DOCX', 'JPG', 'PNG'].includes(docType) ? docType : 'DOCX',
          uploadDate: new Date().toISOString().split('T')[0],
        });
      });
      setSelectedFiles([]);
      addToast(`${fileCount} document(s) uploaded successfully.`, 'success');
    }
  };

  const handleDownload = (doc: CustomerDocument) => {
    const fileContent = `This is a mock document for ${doc.name}.\n\nType: ${doc.type}\nUploaded On: ${doc.uploadDate}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Documents</h2>
              {customerData?.documents.length > 0 ? (
                <div className="space-y-3">
                    {customerData.documents.map(doc => (
                       <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                         <div className="flex items-center space-x-3 overflow-hidden">
                           {getDocumentIcon(doc.type)}
                           <div className="overflow-hidden">
                             <p className="font-medium text-gray-700 truncate">{doc.name}</p>
                             <p className="text-xs text-gray-500">Uploaded: {doc.uploadDate}</p>
                           </div>
                         </div>
                         <button onClick={() => handleDownload(doc)} title={`Download ${doc.name}`} className="p-2 rounded-md transition-colors bg-blue-100 text-primary hover:bg-blue-200">
                           <DownloadIcon className="w-5 h-5" />
                         </button>
                       </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No documents have been uploaded yet.</p>
              )}
            </Card>
          </div>
          <div>
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                      <span>Upload files</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.docx"/>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOCX, JPG, PNG up to 10MB</p>
                </div>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                    <ul className="mb-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                                <span className="truncate">{file.name}</span>
                                <span className="flex-shrink-0 text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={handleUpload} className="w-full">Upload {selectedFiles.length} file(s)</Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;