import React, { useEffect, useState } from 'react';
import './StarRating.css';
import ApiCall from "../../../config"; // Assume this is your custom API calling function

const StarRating = (props) => {
    const [rating, setRating] = useState(0); // Local rating state
    const { subcategory, student } = props;
    const [enttyRating, setEnttyRating] = useState(null)
    const [ratingValue, setRatingValue] = useState({
        student: student,
        subCategory: subcategory,
        rating: 0
    });

    useEffect(() => {
        if (student?.id && subcategory?.id) {
            getRating(student.id, subcategory.id);
        }
    }, [student, subcategory]);

    // GET request to fetch the existing rating for a student-subcategory pair
    const getRating = async (studentId, subCategoryId) => {
        try {
            const response = await ApiCall(`/api/v1/rating/student/${studentId}/${subCategoryId}`, "GET");
            if (response.data) {
                setEnttyRating(response.data)
                setRating(response.data.rating); // Set the fetched rating
                setRatingValue({
                    ...ratingValue,
                    rating: response.data.rating
                });
            }
        } catch (error) {
            console.error("Error fetching rating:", error);
            setRating(0); // Reset to 0 if there's no existing rating
        }
    };

    // POST request to add a new rating
    const addRating = async () => {

    };

    // PUT request to update an existing rating
    const updateRating = async () => {

    };

    const handleClick = async (value) => {
        setRating(value);
        setRatingValue({
            ...ratingValue,
            rating: value
        });

        ratingValue.student = student
        ratingValue.subCategory = subcategory
        ratingValue.rating = value
        if (rating === 0) {
            try {
                await ApiCall("/api/v1/rating/student", "POST", ratingValue);
                alert(subcategory.name+" xizmati uchun bergan ovozingiz qabul qilindi!");
            } catch (error) {
                console.error("Error adding rating:", error);
                alert("Failed to add rating");
            }
        } else {
            ratingValue.id=enttyRating.id
            try {
                await ApiCall("/api/v1/rating/student", "PUT", ratingValue);
                alert(subcategory.name+" xizmati uchun bergan ovozingiz qabul qilindi!");

            } catch (error) {
                console.error("Error updating rating:", error);
                alert("Failed to update rating");
            }
        }
    };

    return (
        <div className="star-rating pt-4 p-2">
            <h1 className="text-center text-xl">Xizmat turini baholang</h1>
            <h2 className="text-start text-md my-2">{subcategory?.name} xizmatini baholash</h2>

            <div className="star-source">
                <svg>
                    <linearGradient x1="50%" y1="5.41294643%" x2="87.5527344%" y2="65.4921875%" id="grad">
                        <stop stopColor="#bf209f" offset="0%" />
                        <stop stopColor="#d62a9d" offset="60%" />
                        <stop stopColor="#ED009E" offset="100%" />
                    </linearGradient>
                    <symbol id="star" viewBox="153 89 106 108">
                        <polygon
                            id="star-shape"
                            stroke="url(#grad)"
                            strokeWidth="5"
                            fill="currentColor"
                            points="206 162.5 176.610737 185.45085 189.356511 150.407797 158.447174 129.54915 195.713758 130.842203 206 95 216.286242 130.842203 253.552826 129.54915 222.643489 150.407797 235.389263 185.45085"
                        />
                    </symbol>
                </svg>
            </div>

            <div className="star-container">
                {[5, 4, 3, 2, 1].map((value) => (
                    <React.Fragment key={value}>
                        <input
                            type="radio"
                            name="star"
                            id={`star-${value}`}
                            checked={rating === value}
                            onChange={() => handleClick(value)}
                        />
                        <label htmlFor={`star-${value}`}>
                            <svg className="star">
                                <use xlinkHref="#star" />
                            </svg>
                        </label>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StarRating;
