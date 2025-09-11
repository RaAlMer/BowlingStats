class ApplicationController < ActionController::API
  attr_reader :current_user

  private

  def authenticate_by_token!
    header = request.headers['Authorization']
    token = header&.split(' ')&.last
    @current_user = User.find_by(api_token: token)
    render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_user
  end
end
