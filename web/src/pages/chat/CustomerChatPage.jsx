import DashboardLayout from '../../components/DashboardLayout';
import ChatShell from '../../components/chat/ChatShell';

const CustomerChatPage = () => {
    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500">Chat with stores you’ve messaged before, or search a store to start.</p>
            </div>
            <ChatShell context="customer" />
        </DashboardLayout>
    );
};

export default CustomerChatPage;

