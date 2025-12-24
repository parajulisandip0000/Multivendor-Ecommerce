import StoreManagerLayout from '../../components/StoreManagerLayout';
import ChatShell from '../../components/chat/ChatShell';

const StoreManagerChatPage = () => {
    return (
        <StoreManagerLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                <p className="text-gray-500">Reply to customers and coordinate with your store admin.</p>
            </div>
            <ChatShell context="staff" />
        </StoreManagerLayout>
    );
};

export default StoreManagerChatPage;

