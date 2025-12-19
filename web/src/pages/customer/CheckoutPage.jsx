import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CheckoutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Checkout</h1>
                <p className="text-gray-600 mt-4">Shipping address, payment method selection, and order confirmation.</p>
            </div>
            <Footer />
        </div>
    );
};

export default CheckoutPage;
