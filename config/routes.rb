Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: [:create]
      post 'login', to: 'sessions#create'
      resources :games, only: [:index, :create, :show] do
        resources :rolls, only: [:index, :create]
      end
      get 'stats/ranking', to: 'stats#ranking'
    end
  end
end
