import SuperAdminLayout from '../../components/SuperAdminLayout';
import ChatShell from '../../components/chat/ChatShell';

const SuperAdminChatPage = () => {
    return (
        <SuperAdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                <p className="text-gray-500">Contact store admins directly.</p>
            </div>
            <ChatShell context="superadmin" />
        </SuperAdminLayout>
    );
};

export default SuperAdminChatPage;

