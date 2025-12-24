import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import ChatShell from '../../components/chat/ChatShell';

const SellerChatPage = () => {
    return (
        <SellerDashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                <p className="text-gray-500">Message your managers and customers.</p>
            </div>
            <ChatShell context="staff" />
        </SellerDashboardLayout>
    );
};

export default SellerChatPage;

