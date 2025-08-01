import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Book({ cartItems, setCartItems, loggedInUser }) {
  const [book, setBook] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function getBook() {
      try {
        const [bookResponse, recResponse] = await Promise.all([
          axios.get(`http://localhost:3000/book/${bookId}`),
          axios.get(`http://localhost:3000/book/recommendations/${bookId}`)
        ]);

        if (bookResponse.data.success) {
          setBook(bookResponse.data.book);
        } else {
          toast.error(bookResponse.data.message);
        }

        if (recResponse.data.success) {
          setRecommendations(recResponse.data.recommendations);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch data");
      }
    }

    getBook();
  }, [bookId]); // Add bookId to dependency array

  const handleRecommendationClick = (id) => {
    navigate(`/${id}`);
    window.scrollTo(0, 0); // Scroll to top when navigating
  };

  const {
    title,
    author,
    category,
    description,
    image,
    pages,
    price,
    quantity,
  } = book;

  async function addToCart() {
    try {
      const response = await axios.post(
        `http://localhost:3000/cart`,
        {
          book,
          cartCount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast(response.data.message);
        setCartItems(response.data.cart);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch book");
    }
  }

  return (
    Object.keys(book).length > 0 && (
      <div style={styles.container}>
        <h2 style={styles.title}>Book Details</h2>
        <div style={styles.bookContainer}>
          <div style={styles.imageContainer}>
            <img src={image} alt={title} style={styles.image} />
          </div>
          <div style={styles.detailsContainer}>
            <p>
              <strong>Title:</strong> {title}
            </p>
            <p>
              <strong>Author:</strong> {author?.fullname}
            </p>
            <p>
              <strong>Category:</strong> {category?.genreName}
            </p>
            <p>
              <strong>Description:</strong> {description}
            </p>
            <p>
              <strong>Pages:</strong> {pages}
            </p>
            <p>
              <strong>Price:</strong> ${price}
            </p>
          </div>
        </div>

        {loggedInUser && !loggedInUser.isAdmin && (
          <div style={styles.cartSection}>
            <div style={styles.quantityControls}>
              <button
                onClick={() => cartCount > 0 && setCartCount(cartCount - 1)}
                style={styles.quantityButton}
              >
                -
              </button>
              <div style={styles.quantityDisplay}>{cartCount}</div>
              <button
                onClick={() => cartCount < quantity && setCartCount(cartCount + 1)}
                style={styles.quantityButton}
              >
                +
              </button>
            </div>
            {cartCount === quantity && <div style={styles.outOfStock}>Out of stock</div>}
            <button onClick={addToCart} style={styles.addToCartButton}>
              Add to Cart
            </button>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div style={styles.recommendationsContainer}>
            <h3 style={styles.recommendationsTitle}>You Might Also Like</h3>
            <div style={styles.recommendationsGrid}>
              {recommendations.map((rec) => (
                <div 
                  key={rec._id} 
                  style={styles.recommendationCard}
                  onClick={() => handleRecommendationClick(rec._id)}
                >
                  <img 
                    src={rec.image} 
                    alt={rec.title} 
                    style={styles.recommendationImage} 
                  />
                  <div style={styles.recommendationDetails}>
                    <p style={styles.recommendationTitle}>{rec.title}</p>
                    <p style={styles.recommendationPrice}>${rec.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    width: "100%",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  bookContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  imageContainer: {
    marginRight: "20px",
    marginBottom: "20px",
  },
  image: {
    width: "250px",
    height: "350px",
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
  },
  detailsContainer: {
    maxWidth: "600px",
    textAlign: "left",
  },
  cartSection: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  quantityButton: {
    padding: "5px 15px",
    fontSize: "16px",
    cursor: "pointer",
  },
  quantityDisplay: {
    minWidth: "30px",
    textAlign: "center",
  },
  outOfStock: {
    color: "red",
    marginBottom: "10px",
  },
  addToCartButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  recommendationsContainer: {
    marginTop: "40px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  },
  recommendationsTitle: {
    fontSize: "20px",
    marginBottom: "20px",
    textAlign: "center",
  },
  recommendationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "20px",
    justifyContent: "center",
  },
  recommendationCard: {
    cursor: "pointer",
    transition: "transform 0.2s",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  recommendationImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "4px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
  },
  recommendationDetails: {
    padding: "10px 0",
  },
  recommendationTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  recommendationPrice: {
    fontSize: "14px",
    color: "#4CAF50",
    fontWeight: "bold",
  },
};