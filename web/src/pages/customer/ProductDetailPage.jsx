import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ProductDetailPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Product Details</h1>
                <p className="text-gray-600 mt-4">This page will show product details, images, reviews, and add to cart functionality.</p>
            </div>
            <Footer />
        </div>
    );
};

export default ProductDetailPage;
