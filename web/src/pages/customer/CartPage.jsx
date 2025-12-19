import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CartPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <p className="text-gray-600 mt-4">Cart items, quantity management, and checkout button will be here.</p>
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;
