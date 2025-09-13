Rails.application.routes.draw do
  get '/auth/google_oauth2/callback', to: 'api/v1/sessions#google_auth'
  get '/auth/failure', to: redirect('/')

  namespace :api do
    namespace :v1 do
      # Email/password login
      post "/login", to: "sessions#create"

      # User registration and profile
      resources :users, only: [:create]
      get "/users/me", to: "users#me"

      resources :games, only: [:index, :create, :show] do
        resources :rolls, only: [:index, :create]
      end
      get 'stats/ranking', to: 'stats#ranking'
    end
  end
end
