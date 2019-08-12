module StashEngine
  class GeolocationBoxSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashDatacite::GeolocationBox.column_names - REJECT_COLUMNS).freeze

  end
end
