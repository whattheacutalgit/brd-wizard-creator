
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";
import { isAuthenticated } from "@/lib/api";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary mr-2" />
            <span className="font-bold text-2xl">BRD Wizard</span>
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row items-center py-16">
          <div className="lg:w-1/2 lg:pr-16 space-y-6 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Generate Business Requirements Documents with AI
            </h1>
            <p className="text-xl text-gray-600">
              BRD Wizard helps you create comprehensive business requirements documents
              powered by AI analysis of your existing project documents.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Upload existing documents for AI analysis</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Generate BRDs with intelligent follow-up questions</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Download professional and comprehensive BRDs</p>
              </div>
            </div>
            <Button size="lg" onClick={() => navigate("/register")} className="mt-8">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="lg:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 text-sm text-gray-500 font-mono">BRD Preview</div>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <h2 className="text-lg font-bold">E-Commerce Platform - Business Requirements Document</h2>
                <h3 className="font-semibold">1. Introduction</h3>
                <p>This document outlines the business requirements for the new e-commerce platform...</p>
                <h3 className="font-semibold">2. Project Overview</h3>
                <p>The e-commerce platform will provide customers with the ability to browse products, add items to cart...</p>
                <h3 className="font-semibold">3. Functional Requirements</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>User authentication and account management</li>
                  <li>Product catalog with search and filtering</li>
                  <li>Shopping cart and checkout functionality</li>
                  <li>Payment processing integration</li>
                  <li>Order management and tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Documents</h3>
              <p className="text-gray-600">
                Upload existing project documents, specifications, and notes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Processing</h3>
              <p className="text-gray-600">
                Our AI analyzes your documents and asks relevant follow-up questions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate BRD</h3>
              <p className="text-gray-600">
                Download a polished, comprehensive Business Requirements Document.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl">BRD Wizard</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 BRD Wizard. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
