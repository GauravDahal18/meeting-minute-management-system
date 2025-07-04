import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const CommitteeDashboard = () => {
  const [Committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('/home');
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Mock API service - replace with real API when backend is ready
  const getAllCommittees = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace this with actual API call
      const mockData = [
        {
          committeeName: "BCT department",
          committeeDescription: "committee for making syllabus",
          committeeMembers: ["Aman Shakya", "Subharna Shakya", "DRP"],
          createdDate: "2024-07-03",
          createdBy: "Admin"
        },
        {
          committeeName: "SIC",
          committeeDescription: "Selection of studends",
          committeeMembers: ["Ram", "Shyam", "Hari"],
          createdDate: "2024-07-20",
          createdBy: "Admin"
        },
        {
          committeeName: "Smart board",
          committeeDescription: "Purchase and installation of smart boards",
          committeeMembers: ["campus chief", "hod"],
          createdDate: "2024-03-10",
          createdBy: "Admin"
        }
      ];
      
      return mockData;
      
      // TODO: Replace above mock data with real API call when backend is ready:
      // const response = await fetch('/api/getAllCommittees');
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      // return data;
      
    } catch (error) {
      console.error('Error fetching Committees:', error);
      setError(error.message);
      return [];
    }
  };

  // Load Committees on component mount
  useEffect(() => {
    const fetchCommittees = async () => {
      setLoading(true);
      try {
        const data = await getAllCommittees();
        // Transform API data to match component structure
        const transformedData = data.map((Committee, index) => ({
          id: index + 1,
          committeeName: Committee.committeeName,
          committeeDescription: Committee.committeeDescription,
          committeeMembers: Committee.committeeMembers,
          createdDate: new Date(Committee.createdDate),
          createdBy: Committee.createdBy
        }));
        setCommittees(transformedData);
      } catch (error) {
        console.error('Failed to load Committees:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, []);

  // Sort Committees by createdDate and Committee name
  const sortCommitteesByDate = () => {
    const sorted = [...Committees].sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate); // Newest first
    });
    setCommittees(sorted);
    setShowSortOptions(false);
  };

  const sortCommitteesByName = () => {
    const sorted = [...Committees].sort((a, b) => {
      return a.committeeName.localeCompare(b.committeeName); // A-Z
    });
    setCommittees(sorted);
    setShowSortOptions(false);
  };

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };

  // Navigate to create Committee URL
  const handleCreateCommittee = () => {
    navigate('/home/createCommittee');
  };

  // Navigate to committee detail URL
  const handleCommitteeClick = (Committee) => {
    const url = `/home/committee?CommitteeId=${Committee.id}`;
    navigate(url);
  };

  // Handle back navigation
  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600">{currentRoute}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading Committees...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600">{currentRoute}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mb-4">Error loading Committees: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border rounded-md hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === '/home/createCommittee') {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600">{currentRoute}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Create Committee</h2>
          
          <button
            onClick={handleBackToHome}
            className="px-6 py-2 border rounded-md hover:shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (selectedCommittee) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600">{currentRoute}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBackToHome}
            className="mb-4 hover:underline"
          >
            ← Back to Committees
          </button>
          
          <div className="rounded-lg p-6 border bg-white">
            <h2 className="text-2xl font-bold mb-4">{selectedCommittee.committeeName}</h2>
            <p className="mb-4">{selectedCommittee.committeeDescription}</p>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Members:</span>
                <div className="ml-4">
                  {selectedCommittee.committeeMembers.map((member, index) => (
                    <div key={index}>• {member}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Created Date:</span>
                <span className="ml-2">{selectedCommittee.createdDate.toLocaleDateString()}</span>
              </div>
              
              <div>
                <span className="font-medium">Created By:</span>
                <span className="ml-2">{selectedCommittee.createdBy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Committee Manager Dashboard</h1>
        
        <div className="border-2 rounded-lg p-6 mb-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              {Committees.map((Committee) => (
                <div
                  key={Committee.id}
                  onClick={() => handleCommitteeClick(Committee)}
                  className="border-2 rounded-lg p-4 w-32 h-24 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow bg-blue-50 hover:bg-blue-100"
                >
                  <span className="text-center text-sm font-medium">{Committee.committeeName}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCreateCommittee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create Committee
              </button>
              
                <div className="relative">
                <button
                  onClick={toggleSortOptions}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <ArrowUpDown size={16} />
                  Sort Committee
                </button>
                
                {showSortOptions && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <button
                      onClick={sortCommitteesByName}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      Sort by Name (A-Z)
                    </button>
                    <button
                      onClick={sortCommitteesByDate}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      Sort by Created Date (Newest First)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;
