module StashEngine
  class GeolocationSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::Geolocation.column_names - REJECT_COLUMNS).freeze

    def hash
      {
        geolocation_place: GeolocationPlaceSerializer.new(@my_model.geolocation_place).hash,
        geolocation_point: GeolocationPointSerializer.new(@my_model.geolocation_point).hash,
        geolocaton_box: GeolocationBoxSerializer.new(@my_model.geolocation_box).hash
      }
    end

  end
end
