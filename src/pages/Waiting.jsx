
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoupleAssessment } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Clock, Users, Coffee } from 'lucide-react';

export default function WaitingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const assessmentId = new URLSearchParams(location.search).get('id');
    const [assessment, setAssessment] = useState(null);

    useEffect(() => {
        if (!assessmentId) {
            navigate(createPageUrl('Home'));
            return;
        }

        const checkStatus = async () => {
            try {
                const currentAssessment = await CoupleAssessment.get(assessmentId);
                setAssessment(currentAssessment);
                if (currentAssessment.status === 'completed') {
                    navigate(createPageUrl(`Report?id=${assessmentId}`));
                }
            } catch (error) {
                console.error("Error fetching assessment status:", error);
                navigate(createPageUrl('Home'));
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [assessmentId, navigate]);

    return (
        <div className="max-w-2xl mx-auto text-center py-20">
            <div className="bg-white p-10 rounded-xl shadow-lg">
                <Clock className="w-16 h-16 text-[#7D9D9C] mx-auto mb-6 animate-pulse" />
                <h1 className="text-3xl font-bold mb-4">Thank You for Completing the Assessment!</h1>
                <p className="text-gray-600 text-lg mb-8">
                    We're now waiting for {assessment?.partner2_name || 'your partner'} to finish their part. This page will automatically redirect you to the report once they're done.
                </p>
                <div className="bg-[#F8F5F2] p-6 rounded-lg text-left space-y-4">
                    <div className="flex items-start">
                        <Users className="w-5 h-5 text-[#7D9D9C] mr-3 mt-1 flex-shrink-0" />
                        <p><strong>What's next?</strong> Once your partner submits their answers, you'll both be able to view a combined report to see where you align.</p>
                    </div>
                    <div className="flex items-start">
                        <Coffee className="w-5 h-5 text-[#7D9D9C] mr-3 mt-1 flex-shrink-0" />
                        <p><strong>Feel free to leave this page.</strong> We'll hold your spot. You can come back to this page's URL at any time to check the status.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
