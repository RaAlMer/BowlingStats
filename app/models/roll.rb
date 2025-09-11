class Roll < ApplicationRecord
  belongs_to :game

  validates :pins, presence: true, inclusion: { in: 0..10 }

  after_create :update_game_total
  after_update :update_game_total
  after_destroy :update_game_total

  def update_game_total
    game&.recalc_total!
  end
end
