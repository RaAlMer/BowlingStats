module Api
  module V1
    class RollsController < ApplicationController
      before_action :authenticate_by_token!

      def index
        game = current_user.games.find(params[:game_id])
        render json: game.rolls
      end

      def create
        game = current_user.games.find(params[:game_id])
        roll = game.rolls.create!(roll_params)
        game.update!(total_score: GameScorer.new(game.rolls).total_score)
        render json: game.as_json(include: :rolls), status: :created
      end

      private

      def roll_params
        params.require(:roll).permit(:frame, :roll_number, :pins)
      end
    end
  end
end
