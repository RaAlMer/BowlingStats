module Api
  module V1
    class StatsController < ApplicationController
      def ranking
        # Get users with their average total_score across games
        users = User.joins(:games)
                    .select('users.*, AVG(games.total_score) AS avg_score')
                    .group('users.id')
                    .order('avg_score DESC')

        render json: users.as_json(methods: [:avg_score])
      end
    end
  end
end
