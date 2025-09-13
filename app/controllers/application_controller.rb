class ApplicationController < ActionController::API
  attr_reader :current_user

  before_action :authenticate_by_token!

  private

  def authenticate_by_token!
    header = request.headers['Authorization']

    if header.present? && header.start_with?("Bearer ")
      token = header.split(' ').last
      @current_user = User.find_by(api_token: token)
    end

    render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_user
  end
end
