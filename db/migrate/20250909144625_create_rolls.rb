class CreateRolls < ActiveRecord::Migration[7.2]
  def change
    create_table :rolls do |t|
      t.references :game, null: false, foreign_key: true
      t.integer :frame
      t.integer :roll_number
      t.integer :pins

      t.timestamps
    end
  end
end
