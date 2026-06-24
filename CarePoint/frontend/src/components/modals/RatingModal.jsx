import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';

function RatingModal({ appointment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    communication: 5,
    professionalism: 5,
    punctuality: 5,
    cleanliness: 5
  });

  const handleCategoryChange = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!rating) {
        toast.error('Please select a rating');
        setLoading(false);
        return;
      }

      const result = await api.createRating({
        appointmentId: appointment._id,
        rating,
        review,
        categories
      });

      toast.success('Rating submitted successfully!');
      onSuccess(result);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-2xl font-bold text-slate-800">Rate Your Experience</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Appointment Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Doctor:</strong> Dr. {appointment.doctor?.user?.name || 'Unknown'}
            </p>
            <p className="text-sm text-blue-900 mt-1">
              <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()} {appointment.time}
            </p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Overall Rating
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-slate-600 mt-2">
              {rating ? `${rating} out of 5 stars` : 'Click to rate'}
            </p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Rate by Category</h3>
            {Object.entries({
              communication: 'Communication',
              professionalism: 'Professionalism',
              punctuality: 'Punctuality',
              cleanliness: 'Cleanliness'
            }).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm text-slate-600 mb-2">{label}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleCategoryChange(key, star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          categories[key] >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              placeholder="Share your experience with this doctor..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="flexible px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;
