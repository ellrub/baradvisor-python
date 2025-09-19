"""
Database models for BarAdvisor application
"""

from datetime import datetime

def create_models(db):
    """Create all model classes with the given db instance"""
    
    class Bar(db.Model):
        """Bar model representing a bar/pub in Bergen"""
        __tablename__ = 'bars'
        
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(100), nullable=False)
        description = db.Column(db.Text)
        address = db.Column(db.String(200))
        latitude = db.Column(db.Float, nullable=False)
        longitude = db.Column(db.Float, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        # Relationships
        ratings = db.relationship('Rating', backref='bar', lazy=True, cascade='all, delete-orphan')
        bar_tags = db.relationship('BarTag', backref='bar', lazy=True, cascade='all, delete-orphan')
        
        @property
        def tags(self):
            """Get all tags for this bar"""
            return [bt.tag for bt in self.bar_tags]
        
        @property
        def average_rating(self):
            """Calculate average rating for this bar"""
            if not self.ratings:
                return 0
            return sum(r.rating for r in self.ratings) / len(self.ratings)
        
        def __repr__(self):
            return f'<Bar {self.name}>'

    class Tag(db.Model):
        """Tag model for categorizing bars"""
        __tablename__ = 'tags'
        
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(50), nullable=False, unique=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        # Relationships
        bar_tags = db.relationship('BarTag', backref='tag', lazy=True, cascade='all, delete-orphan')
        
        def __repr__(self):
            return f'<Tag {self.name}>'

    class BarTag(db.Model):
        """Association table for many-to-many relationship between bars and tags"""
        __tablename__ = 'bar_tags'
        
        id = db.Column(db.Integer, primary_key=True)
        bar_id = db.Column(db.Integer, db.ForeignKey('bars.id'), nullable=False)
        tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        # Unique constraint to prevent duplicate tag assignments
        __table_args__ = (db.UniqueConstraint('bar_id', 'tag_id', name='unique_bar_tag'),)
        
        def __repr__(self):
            return f'<BarTag bar_id={self.bar_id} tag_id={self.tag_id}>'

    class Rating(db.Model):
        """Rating model for user ratings of bars"""
        __tablename__ = 'ratings'
        
        id = db.Column(db.Integer, primary_key=True)
        bar_id = db.Column(db.Integer, db.ForeignKey('bars.id'), nullable=False)
        rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
        user_identifier = db.Column(db.String(100), nullable=False)  # IP address or user ID
        comment = db.Column(db.Text)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        # Constraints
        __table_args__ = (
            db.CheckConstraint('rating >= 1 AND rating <= 5', name='rating_range'),
            db.UniqueConstraint('bar_id', 'user_identifier', name='unique_user_rating'),
        )
        
        def __repr__(self):
            return f'<Rating {self.rating}⭐ for bar_id={self.bar_id}>'
    
    return Bar, Tag, BarTag, Rating
