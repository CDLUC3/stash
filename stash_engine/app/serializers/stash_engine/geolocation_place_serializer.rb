module StashEngine
  class GeolocationPlaceSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashDatacite::GeolocationPlace.column_names - REJECT_COLUMNS).freeze

  end
end