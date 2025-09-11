class CreateGames < ActiveRecord::Migration[7.2]
  def change
    create_table :games do |t|
      t.references :user, null: false, foreign_key: true
      t.datetime :played_at
      t.integer :total_score

      t.timestamps
    end
  end
end
