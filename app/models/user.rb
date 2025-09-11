class User < ApplicationRecord
  has_secure_password            # needs password_digest (bcrypt)
  has_secure_token :api_token    # creates/refreshes api_token if nil
  has_many :games, dependent: :destroy

  validates :email, presence: true, uniqueness: true
end
