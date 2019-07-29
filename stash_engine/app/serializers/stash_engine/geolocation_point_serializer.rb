module StashEngine
  class GeolocationPointSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashDatacite::GeolocationPoint.column_names - REJECT_COLUMNS).freeze

  end
end
