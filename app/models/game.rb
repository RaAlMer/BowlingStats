class Game < ApplicationRecord
  belongs_to :user
  has_many :rolls, dependent: :destroy

  # calculate total_score when rolls change
  def recalc_total!
    update_column(:total_score, rolls.sum(:pins))
  end
end
