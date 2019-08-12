class MigrateDataToGeolocation < ActiveRecord::Migration
  def self.up

    # getting rid of this since these were migrated a long time ago

    remove_column :dcs_geo_location_places, :resource_id
    remove_column :dcs_geo_location_places, :latitude
    remove_column :dcs_geo_location_places, :longitude
    remove_column :dcs_geo_location_points, :resource_id
    remove_column :dcs_geo_location_boxes, :resource_id
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
