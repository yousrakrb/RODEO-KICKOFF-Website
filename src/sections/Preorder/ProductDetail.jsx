import { Link, useParams } from "react-router-dom";
import { PRODUCTS, MAX_QTY } from "./products";
import { useCart } from "./useCart";
import ProductGallery from "./ProductGallery";

const fmt = (n) => `${n.toLocaleString("en-US")} DZD`;

export default function ProductDetail() {
    const { productId } = useParams();
    const product = PRODUCTS.find((item) => item.id === productId);
    const [cart, setItem] = useCart();

    if (!product) {
        return (
            <main className="po">
                <div className="po-wrap po-detail-wrap">
                    <Link className="po-back" to="/preorder">&larr; Back to goodies</Link>
                    <p className="po-sub">That product could not be found.</p>
                </div>
            </main>
        );
    }

    const item = cart[product.id];
    const qty = item?.qty || 0;

    return (
        <main className="po">
            <div className="po-wrap po-detail-wrap">
                <Link className="po-back" to="/preorder">&larr; Back to goodies</Link>
                <div className="po-detail">
                    <div className="po-detail-media">
                        <ProductGallery images={product.images} alt={product.name} large />
                    </div>
                    <div className="po-detail-info">
                        <h1>{product.name}</h1>
                        <p className="po-note">{product.note}</p>
                        <p className="po-price">{fmt(product.price)}</p>
                        {product.sizes.length > 0 && (
                            <div className="po-sizes" role="radiogroup" aria-label={`${product.name} size`}>
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        role="radio"
                                        aria-checked={item?.size === size}
                                        className={item?.size === size ? "on" : ""}
                                        onClick={() => setItem(product.id, { size, qty: qty || 1 })}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="po-action">
                            {qty === 0 ? (
                                <button type="button" className="po-add" onClick={() => setItem(product.id, { qty: 1 })}>
                                    Add to order
                                </button>
                            ) : (
                                <div className="po-qty" aria-label={`${product.name} quantity`}>
                                    <button type="button" aria-label="Remove one" onClick={() => setItem(product.id, { qty: qty - 1 })}>&minus;</button>
                                    <span>{qty}</span>
                                    <button type="button" aria-label="Add one" disabled={qty >= MAX_QTY} onClick={() => setItem(product.id, { qty: qty + 1 })}>+</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
