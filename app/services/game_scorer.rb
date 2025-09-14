class GameScorer
  def initialize(rolls)
    # sort rolls by frame and roll_number
    @rolls = rolls.sort_by { |r| [r.frame, r.roll_number] }
    @pins = @rolls.map(&:pins)
  end

  def total_score
    score = 0
    roll_index = 0

    10.times do
      if strike?(roll_index)
        score += 10 + strike_bonus(roll_index)
        roll_index += 1
      elsif spare?(roll_index)
        score += 10 + spare_bonus(roll_index)
        roll_index += 2
      else
        score += frame_score(roll_index)
        roll_index += 2
      end
    end

    score
  end

  private

  def strike?(i)
    @pins[i] == 10
  end

  def spare?(i)
    @pins[i].to_i + @pins[i + 1].to_i == 10
  end

  def strike_bonus(i)
    @pins[i + 1].to_i + @pins[i + 2].to_i
  end

  def spare_bonus(i)
    @pins[i + 2].to_i
  end

  def frame_score(i)
    @pins[i].to_i + @pins[i + 1].to_i
  end
end
