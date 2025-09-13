module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_by_token!, only: [:me]

      # POST /api/v1/users
      def create
        user = User.new(user_params)
        if user.save
          user.regenerate_api_token if user.api_token.blank?
          render json: { user: user.as_json(only: [:id, :name, :email, :api_token]) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/users/me
      def me
        render json: { user: current_user.as_json(only: [:id, :name, :email, :api_token]) }
      end

      private

      def user_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation)
      end
    end
  end
end
