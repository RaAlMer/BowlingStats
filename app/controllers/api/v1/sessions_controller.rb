class Api::V1::SessionsController < ApplicationController
  skip_before_action :authenticate_by_token!, only: [:google_auth, :create]

  # POST /api/v1/login
  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      user.regenerate_api_token if user.api_token.blank?
      render json: { user: user.as_json(only: [:id, :name, :email, :api_token]) }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  # GET /auth/google_oauth2/callback
  def google_auth
    auth = request.env["omniauth.auth"]
    user = User.find_or_create_by(email: auth["info"]["email"]) do |u|
      u.name = auth["info"]["name"]
      u.password = SecureRandom.hex(10) # random password
      u.api_token = SecureRandom.hex(20)
    end

    user.regenerate_api_token if user.api_token.blank?

    # Redirect to frontend
    redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{user.api_token}"
  end
end
