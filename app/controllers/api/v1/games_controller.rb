module Api
  module V1
    class GamesController < ApplicationController
      before_action :authenticate_by_token!, only: [:create, :index, :show]

      def index
        games = current_user.games.includes(:rolls)
        render json: games.as_json(include: :rolls)
      end

      def create
        game = current_user.games.create!(played_at: Time.current, total_score: 0)
        render json: game, status: :created
      end

      def show
        game = current_user.games.find(params[:id])
        render json: game.as_json(include: :rolls)
      end
    end
  end
end
